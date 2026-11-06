from datetime import date
from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="AgriSmart Recommendation Service", version="2.0.0")

class Product(BaseModel):
    id: int
    name: str
    price: float = 0
    unit: str = "kg"
    stock: int = 0
    origin: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class Interaction(BaseModel):
    category_id: Optional[int] = None
    event_type: str = "view"
    weight: float = 1

class RecommendPayload(BaseModel):
    user_id: Optional[int] = None
    products: List[Product] = Field(default_factory=list)
    interactions: List[Interaction] = Field(default_factory=list)
    preferred_category_id: Optional[int] = None

class AnalyzePayload(BaseModel):
    name: str = ""
    category: str = ""
    description: str = ""
    origin: str = ""
    certification: str = ""
    harvest_date: Optional[str] = None
    stock: Optional[int] = None
    storage_condition: str = ""
    image_url: str = ""

@app.get("/health")
def health():
    return {"status": "ok", "service": "agrismart-ai", "engine": "explainable-rules-v2"}

@app.post("/recommend")
def recommend(payload: RecommendPayload):
    products = [p for p in payload.products if p.stock > 0]
    interest = {}
    event_weight = {"view": 1.0, "favorite": 2.0, "purchase": 4.0}
    for event in payload.interactions:
        if event.category_id is not None:
            interest[event.category_id] = interest.get(event.category_id, 0.0) + event_weight.get(event.event_type, 1.0) * max(event.weight, 0.1)
    max_interest = max(interest.values(), default=0.0)

    def rank(product):
        category_score = interest.get(product.category_id, 0.0) / max_interest if max_interest else 0.0
        if payload.preferred_category_id and product.category_id == payload.preferred_category_id:
            category_score = max(category_score, 1.0)
        availability_score = min(product.stock, 50) / 50
        low_stock_penalty = 0.25 if product.stock <= 3 else 0.0
        score = category_score * 0.72 + availability_score * 0.28 - low_stock_penalty
        reasons = []
        if payload.preferred_category_id == product.category_id:
            reasons.append("Đúng nhóm bạn vừa chọn")
        elif category_score > 0:
            reasons.append("Phù hợp với nhóm bạn thường xem hoặc mua")
        if product.stock > 3:
            reasons.append("Còn hàng ổn định")
        elif product.stock > 0:
            reasons.append("Số lượng còn ít")
        if not reasons:
            reasons.append("Đang còn hàng")
        return score, " · ".join(reasons)

    ranked = sorted(((p, *rank(p)) for p in products), key=lambda item: (item[1], item[0].stock), reverse=True)[:8]
    return {
        "strategy": "personalized-rules-v2" if interest or payload.preferred_category_id else "inventory-rules-v2",
        "user_id": payload.user_id,
        "items": [{**product.model_dump(), "score": round(score, 3), "reason": reason} for product, score, reason in ranked],
        "explanation": "Xếp hạng minh bạch theo danh mục quan tâm và lượng hàng còn lại; không phải mô hình học máy đã huấn luyện.",
    }

@app.post("/analyze-product")
def analyze_product(payload: AnalyzePayload):
    text = f"{payload.name} {payload.description}".lower()
    groups = {
        "Trái cây": ["sầu riêng", "xoài", "cam", "chuối", "bưởi", "nhãn", "vải", "thanh long", "dưa hấu", "nho", "mít", "bơ", "ổi", "măng cụt"],
        "Rau củ": ["rau", "cải", "cà rốt", "cà chua", "dưa leo", "dưa chuột", "bắp cải", "bí", "khoai", "hành", "tỏi", "ớt"],
        "Gạo & ngũ cốc": ["gạo", "lúa", "ngô", "bắp", "đậu", "nếp", "yến mạch"],
    }
    guessed = payload.category or "Nông sản khác"
    if not payload.category:
        for group, keywords in groups.items():
            if any(keyword in text for keyword in keywords):
                guessed = group
                break
    warnings = []
    if len(payload.name.strip()) < 3:
        warnings.append("Tên sản phẩm quá ngắn; hãy ghi rõ loại nông sản và giống.")
    if len(payload.description.strip()) < 20:
        warnings.append("Bổ sung mô tả về đặc điểm, cách đóng gói và tình trạng sản phẩm.")
    if not payload.origin.strip():
        warnings.append("Chưa có thông tin vùng trồng hoặc nơi sản xuất.")
    if not payload.harvest_date:
        warnings.append("Chưa có ngày thu hoạch.")
    else:
        try:
            if date.fromisoformat(payload.harvest_date) > date.today():
                warnings.append("Ngày thu hoạch đang ở tương lai; hãy kiểm tra lại.")
        except ValueError:
            warnings.append("Ngày thu hoạch không đúng định dạng.")
    if payload.stock is not None and payload.stock <= 0:
        warnings.append("Tồn kho phải lớn hơn 0 trước khi mở bán.")
    if not payload.storage_condition.strip():
        warnings.append("Nên bổ sung hướng dẫn bảo quản.")
    if payload.certification.strip():
        warnings.append("Chứng nhận do người bán khai báo; hệ thống chưa xác minh tính hợp lệ.")
    return {
        "engine": "explainable-rules-v2",
        "suggested_category": guessed,
        "category_matches_input": not payload.category or guessed.lower() in payload.category.lower(),
        "warnings": warnings,
        "ready_for_review": len([w for w in warnings if "tương lai" in w or "lớn hơn 0" in w]) == 0,
        "disclaimer": "Đây là kiểm tra tự động theo quy tắc và nội dung nhập. Hệ thống không phân tích ảnh, không xác minh chứng nhận, chất lượng hay nguồn gốc.",
    }
