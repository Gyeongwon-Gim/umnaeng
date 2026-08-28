import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { StoreProvider } from "./lib/store";
import ListPage from "./routes/ListPage";
import AddPage from "./routes/AddPage";
import EditPage from "./routes/EditPage";
import { AppRoot, BackButton, HeaderBar, HeaderTitle, Main } from "./App.styles";
import { Icon } from "./components/Icon";

function Header({ title, showBack }: { title: string; showBack: boolean }) {
  const navigate = useNavigate();
  return (
    <HeaderBar>
      {showBack ? (
        <BackButton onClick={() => navigate(-1)}>
          <Icon>arrow_back</Icon>
        </BackButton>
      ) : (
        <div style={{ width: 40 }} />
      )}
      <HeaderTitle>{title}</HeaderTitle>
    </HeaderBar>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppRoot>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header title="엄냉관" showBack={false} />
                  <Main>
                    <ListPage />
                  </Main>
                </>
              }
            />
            <Route
              path="/add"
              element={
                <>
                  <Header title="사진으로 등록" showBack />
                  <Main>
                    <AddPage />
                  </Main>
                </>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <>
                  <Header title="항목 수정" showBack />
                  <Main>
                    <EditPage />
                  </Main>
                </>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppRoot>
      </StoreProvider>
    </BrowserRouter>
  );
}
