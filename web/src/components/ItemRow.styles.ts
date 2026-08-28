import styled from "styled-components";

export const Wrap = styled.div`
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
  margin: 6px 12px;
  border-radius: 14px;
`;

export const ActionsLeft = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  background: #43a047;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 28px;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  text-align: center;
  white-space: pre-line;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
`;

export const ActionsRight = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  background: #1e88e5;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 28px;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  text-align: center;
  white-space: pre-line;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
`;

export const Card = styled.div<{ $bg: string }>`
  position: relative;
  display: flex;
  align-items: center;
  padding: 32px 16px;
  background: ${(p) => p.$bg};
`;

export const Thumb = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  margin-right: 16px;
  object-fit: cover;
  flex-shrink: 0;
`;

export const ThumbPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  margin-right: 16px;
  flex-shrink: 0;
  background: #f1f8e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

export const Body = styled.div`
  flex: 1;
  min-width: 0;
  text-align: left;
`;

export const Name = styled.div`
  font-size: 19px;
  font-weight: 600;
  color: #212121;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Meta = styled.div`
  font-size: 14px;
  color: #757575;
  margin-top: 4px;
`;

export const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 64px;
  margin-left: 8px;
`;

export const Dday = styled.span<{ $color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${(p) => p.$color};
`;

export const Badge = styled.span<{ $color: string }>`
  font-size: 13px;
  margin-top: 4px;
  font-weight: 600;
  color: ${(p) => p.$color};
`;

export const MoreBtn = styled.button`
  padding: 8px;
  margin-left: 4px;
  color: #bdbdbd;
  font-size: 18px;
  flex-shrink: 0;
`;
