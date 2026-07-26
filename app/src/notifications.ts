// 임박 알림 (PRD FR-5). 복수 임박 항목을 1건으로 묶어 사용자 설정 시각에 발송.

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { FridgeItem } from "./types";
import { imminentCount } from "./store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 구형 필드 (SDK 호환)
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("imminent", {
      name: "임박 알림",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * 매일 지정 시각에 발송될 임박 알림을 재예약한다 (FR-5.2/5.3).
 * 복수 항목이면 1건으로 묶는다.
 * @param hour 발송 시각 (기본 9시)
 */
export async function scheduleDailyImminentNotice(
  items: FridgeItem[],
  hour = 9,
  minute = 0,
): Promise<void> {
  // 기존 예약 정리 후 재예약
  await Notifications.cancelAllScheduledNotificationsAsync();

  const count = imminentCount(items);
  if (count === 0) return;

  const body =
    count === 1
      ? "오늘 안에 먹어야 할 항목이 1개 있어요."
      : `오늘 안에 먹어야 할 항목이 ${count}개 있어요.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "엄냉관",
      body, // FR-5.2: 묶음 발송
      data: { screen: "list" }, // 탭 시 리스트 진입 (FR-5.4)
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
