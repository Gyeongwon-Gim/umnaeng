// Google Fonts "Material Symbols Outlined" 기반 아이콘 — 이모지 대신 사용
// 사용법: <Icon>add</Icon>, <Icon $size={20}>close</Icon> (이름은 Material Symbols 리거처명)

import styled from "styled-components";

export const Icon = styled.span.attrs({ "aria-hidden": true })<{ $size?: number }>`
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
  -webkit-font-smoothing: antialiased;
  font-size: ${(p) => p.$size ?? 24}px;
  user-select: none;
`;
