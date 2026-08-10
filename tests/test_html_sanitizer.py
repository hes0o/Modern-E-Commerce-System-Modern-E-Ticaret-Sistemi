from app.core.html_sanitizer import sanitize_html


def test_sanitize_html_removes_dangerous_content():
    unsafe_html = """
    <p onclick="alert('xss')">Güvenli açıklama</p>
    <script>alert('xss')</script>
    <a href="javascript:alert('xss')">Zararlı bağlantı</a>
    """

    cleaned_html = sanitize_html(unsafe_html)

    assert "<script" not in cleaned_html
    assert "alert('xss')" not in cleaned_html
    assert "onclick" not in cleaned_html
    assert "javascript:" not in cleaned_html
    assert "Güvenli açıklama" in cleaned_html


def test_sanitize_html_preserves_allowed_formatting():
    safe_html = (
        "<h2>Ürün Özellikleri</h2>"
        "<p><strong>Dayanıklı</strong> malzeme</p>"
        "<ul><li>Birinci özellik</li></ul>"
    )

    cleaned_html = sanitize_html(safe_html)

    assert "<h2>Ürün Özellikleri</h2>" in cleaned_html
    assert "<strong>Dayanıklı</strong>" in cleaned_html
    assert "<li>Birinci özellik</li>" in cleaned_html


def test_sanitize_html_secures_external_links():
    cleaned_html = sanitize_html(
        '<a href="https://example.com" target="_blank">Ürün bağlantısı</a>'
    )

    assert 'href="https://example.com"' in cleaned_html
    assert 'rel="noopener noreferrer"' in cleaned_html