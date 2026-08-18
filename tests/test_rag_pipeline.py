from src.rag_pipeline import index_jd_text, get_vectordb


def test_index_jd_text_replaces_previous_jd_chunks():
    """
    Regression test: every /jd call used to permanently add chunks to ChromaDB
    with no cleanup, so an old, unrelated job description could leak into
    RETRIEVED_JD_SNIPPETS for a completely different JD later on.
    """
    vectordb = get_vectordb()

    index_jd_text(
        "We are hiring a Backend Engineer with deep Django and PostgreSQL experience."
    )
    first_pass = vectordb.get(where={"doc_type": "jd"}, include=["documents"])
    assert len(first_pass["ids"]) > 0
    assert any("Django" in doc for doc in first_pass["documents"])

    index_jd_text(
        "We are hiring a Frontend Engineer with deep React and TypeScript experience."
    )
    second_pass = vectordb.get(where={"doc_type": "jd"}, include=["documents"])
    assert len(second_pass["ids"]) > 0

    # the old JD's chunks must be gone - only the new JD's content should remain
    assert not any("Django" in doc for doc in second_pass["documents"])
    assert any("React" in doc for doc in second_pass["documents"])
