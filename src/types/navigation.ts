import { AccessMenu, Spot } from "./user";

// navigation/types.ts
export type RootStackParamList = {
  SpotScreen: { menu: AccessMenu };
  CreateReportScreen: { spot: Spot };
  // route lain jika ada...
};
