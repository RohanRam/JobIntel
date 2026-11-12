from flask import request

def get_pagination_params(default_page=1, default_page_size=20, max_page_size=100):
    try:
        page = int(request.args.get("page", default_page))
        if page < 1:
            page = 1
    except (ValueError, TypeError):
        page = default_page

    try:
        page_size = int(request.args.get("page_size", default_page_size))
        if page_size < 1:
            page_size = default_page_size
        elif page_size > max_page_size:
            page_size = max_page_size
    except (ValueError, TypeError):
        page_size = default_page_size

    return page, page_size

def paginate_records(records, page, page_size, total_count=None):
    if total_count is None:
        total_count = len(records)
    
    total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 0
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    
    return {
        "items": records[start_idx:end_idx] if isinstance(records, list) else records,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    }

