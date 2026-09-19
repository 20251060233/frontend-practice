from docx import Document

doc = Document(r"C:\Users\ASUS\Desktop\python报告模板.docx")
for i, p in enumerate(doc.paragraphs):
    if p.text.strip():
        print(f"[{i}] style={p.style.name} | {p.text[:80]}")
