import styled from "styled-components";

export const AppRoot = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 8px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const BackButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2e7d32;
  font-size: 22px;
`;

export const HeaderTitle = styled.div`
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #2e7d32;
  margin-right: 40px;
`;

export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
