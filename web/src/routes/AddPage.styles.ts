import styled, { keyframes } from "styled-components";

export const Pick = styled.div`
  min-height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
`;

export const PickTitle = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #212121;
  text-align: center;
`;

export const PickDesc = styled.div`
  font-size: 14px;
  color: #757575;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 32px;
`;

export const BigBtn = styled.button<{ $alt?: boolean }>`
  background: ${(p) => (p.$alt ? "#f1f8e9" : "#2e7d32")};
  padding: 18px;
  border-radius: 14px;
  text-align: center;
  margin-bottom: 12px;
`;

export const BigBtnText = styled.span<{ $alt?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${(p) => (p.$alt ? "#2e7d32" : "#fff")};
  font-size: 16px;
  font-weight: 700;
`;

export const ManualEntryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  margin-top: 4px;
  color: #757575;
  font-size: 14px;
  font-weight: 600;
`;

export const Loading = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #fff;
`;

export const Preview = styled.img`
  width: 220px;
  height: 220px;
  border-radius: 16px;
  object-fit: cover;
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  margin-top: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #c8e6c9;
  border-top-color: #2e7d32;
  animation: ${spin} 0.8s linear infinite;
`;

export const LoadingText = styled.div`
  margin-top: 16px;
  color: #555;
  font-size: 15px;
`;

export const Confirm = styled.div`
  padding: 16px;
  background: #fafafa;
  min-height: 100%;
`;

export const PreviewSmall = styled.img`
  width: 100%;
  height: 160px;
  border-radius: 14px;
  margin-bottom: 12px;
  object-fit: cover;
`;

export const ErrorBox = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-size: 14px;
`;

export const HintBox = styled.div`
  background: #fff8e1;
  color: #f57f17;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-size: 14px;
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
`;

export const Rationale = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #9e9e9e;
`;

export const AddRow = styled.button`
  padding: 14px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed #c8e6c9;
  margin-bottom: 20px;
  width: 100%;
`;

export const AddRowText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2e7d32;
  font-weight: 600;
`;

export const SaveBtn = styled.button`
  background: #2e7d32;
  padding: 16px;
  border-radius: 14px;
  text-align: center;
  width: 100%;
`;

export const SaveBtnText = styled.span`
  color: #fff;
  font-size: 16px;
  font-weight: 700;
`;
