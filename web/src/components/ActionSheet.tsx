// Alert.alert(다중 버튼) 대체 — 길게 눌러 메뉴(NFR-6), 냉동 이동 확인 등에서 재사용

import { Backdrop, Header, Message, Option, Sheet, Title } from "./ActionSheet.styles";

export interface ActionSheetOption {
  key: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface Props {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
  onClose: () => void;
}

export function ActionSheet({ title, message, options, cancelLabel = "닫기", onClose }: Props) {
  return (
    <Backdrop onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()}>
        {(title || message) && (
          <Header>
            {title && <Title>{title}</Title>}
            {message && <Message>{message}</Message>}
          </Header>
        )}
        {options.map((opt) => (
          <Option
            key={opt.key}
            $destructive={opt.destructive}
            onClick={() => {
              opt.onSelect();
              onClose();
            }}
          >
            {opt.label}
          </Option>
        ))}
        <Option $cancel onClick={onClose}>
          {cancelLabel}
        </Option>
      </Sheet>
    </Backdrop>
  );
}
