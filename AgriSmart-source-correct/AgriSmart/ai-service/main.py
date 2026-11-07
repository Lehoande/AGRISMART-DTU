from typing import Optional, List
from fastapi import FastAPI
from pydantic import BaseModel
app = FastAPI(title="AgriSmart Recommendation Service", version="1.0.0")
class Product(BaseModel):
    id: int
    name: str
    price: float = 0
    unit: str = "kg"
    stock: int = 0
    origin: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
class Payload(BaseModel):
    user_id: Optional[int] = None
    products: List[Product] = []
    preferred_category_id: Optional[int] = None
@app.get("/health")
def health():
    return {"status":"ok"}
@app.post("/recommend")
def recommend(payload: Payload):
    items=[p for p in payload.products if p.stock>0]
    def score(p):
        return min(p.stock,100)/100 + (2 if payload.preferred_category_id and p.category_id==payload.preferred_category_id else 0)
    items.sort(key=score,reverse=True)
    return {"strategy":"rule-based-v1","user_id":payload.user_id,"items":[p.model_dump() for p in items[:8]],"explanation":"Ưu tiên sản phẩm còn hàng và danh mục phù hợp; thuật toán luật cho MVP."}
