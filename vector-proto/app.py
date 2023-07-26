import streamlit as st
from PyPDF2 import PdfReader
from langchain.chat_models import AzureChatOpenAI, ChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)

personal = st.secrets["DB_OPENAI_KEY"]
model = ChatOpenAI(openai_api_key=personal)
embeddings = OpenAIEmbeddings(openai_api_key=personal)

st.write("# GPTTextbook")
st.write("### The convenience of ChatGPT with the accuracy of a textbook!")

@st.cache_data
def load_and_chunk_textbook(file_path):
    reader = PdfReader(file_path)
    raw_text = ''
    total_pages = len(reader.pages)

    progress_bar_load_and_chunk_textbook = st.progress(0)

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            raw_text += text

        progress_bar_load_and_chunk_textbook.progress(int((i + 1) / total_pages * 50))
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    texts = text_splitter.split_text(raw_text)
    progress_bar_load_and_chunk_textbook.progress(50)
    docsearch = FAISS.from_texts(texts, embeddings)
    progress_bar_load_and_chunk_textbook.progress(100)

    st.write("Done loading!")
    return docsearch

textbook = st.selectbox(label="Choose your textbook or upload your own, and experience the precision of GPT models trained specifically on it, delivering direct answers sourced from your assigned course materials and syllabus while avoiding any irrelevant information!", options=["Select Textbook", "Upload your own!", "By The People - A History of the United States", "A History of Westen Society"])
if textbook != "Select Textbook":
    if textbook == "Upload your own!":
        file = st.file_uploader("Upload your own textbook here:", type="pdf")
        if file:
            st.write("Loading textbook...")
            docsearch = load_and_chunk_textbook(file)

            st.write("### Ask chatGPT a question:")
            question = st.text_input(label="Enter your question here:", value="")

            if question != "":
                context = docsearch.similarity_search(question)
                context_new = ""
                for c in context:
                    context_new += c.page_content
                context = context_new
                messages = [
                    SystemMessage(content="You are a helpful assistant that answers questions based on context given from a document. These documents may be historical and contain sensitive topics. The chances of abuse for this system are very low. Understand that the questions may have a political context and do your best to still try and answer them without claiming you cannot because of a content guideline violation."),
                    HumanMessage(content=f"Context: {context}\nQuestion: {question}")
                ]
                st.write(model(messages).content)
    else:
        docsearch = FAISS.load_local(f"vector-proto/Embeddings/{textbook}.faiss", embeddings)

        st.write("### Ask chatGPT a question:")
        question = st.text_input(label="Enter your question here:", value="")

        if question != "":
            context = docsearch.similarity_search(question)
            context_new = ""
            for c in context:
                context_new += c.page_content
            context = context_new
            messages = [
                SystemMessage(content="You are a helpful assistant that answers questions based on context given from a document."),
                HumanMessage(content=f"Context: {context}\nQuestion: {question}")
            ]
            st.write(model(messages).content)
