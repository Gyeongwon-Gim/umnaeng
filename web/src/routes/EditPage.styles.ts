import styled from "styled-components";

export const Container = styled.div`
  min-height: 100%;
  padding: 16px;
  background: #fafafa;
`;

export const Preview = styled.img`
  width: 100%;
  height: 160px;
  border-radius: 14px;
  margin-bottom: 12px;
  object-fit: cover;
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 20px;
`;

export const Rationale = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #9e9e9e;
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

export const Missing = styled.div`
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MissingText = styled.div`
  color: #9e9e9e;
  font-size: 15px;
`;
