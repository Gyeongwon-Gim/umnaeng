import styled from "styled-components";

export const NameRow = styled.div`
  display: flex;
  align-items: center;
`;

export const NameInput = styled.input`
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #212121;
  padding: 4px 0;
  border: none;
  outline: none;
  background: transparent;
`;

export const RemoveButton = styled.button`
  font-size: 18px;
  color: #bdbdbd;
  padding: 0 8px;
`;

export const Row = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
`;

export const Chip = styled.button`
  background: #f1f8e9;
  padding: 6px 12px;
  border-radius: 14px;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
`;

export const Stepper = styled.div`
  display: flex;
  align-items: center;
  background: #f1f8e9;
  border-radius: 14px;
  overflow: hidden;
`;

export const StepBtn = styled.button`
  padding: 6px 12px;
  color: #2e7d32;
  font-size: 14px;
  font-weight: 700;
`;

export const StepValue = styled.span`
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;
