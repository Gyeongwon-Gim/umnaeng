import styled, { keyframes } from "styled-components";

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
`;

const slideUp = keyframes`
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Sheet = styled.div`
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 8px 16px calc(16px + env(safe-area-inset-bottom));
  animation: ${slideUp} 0.15s ease-out;
`;

export const Header = styled.div`
  padding: 12px 4px;
  text-align: center;
`;

export const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #212121;
`;

export const Message = styled.div`
  font-size: 13px;
  color: #757575;
  margin-top: 4px;
`;

export const Option = styled.button<{ $destructive?: boolean; $cancel?: boolean }>`
  width: 100%;
  text-align: center;
  padding: 16px 4px;
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => (p.$destructive ? "#c62828" : p.$cancel ? "#757575" : "#2e7d32")};
  border-top: 1px solid #eee;
`;
