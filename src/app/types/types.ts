export type Chat = {
  message: string;
  user: string;
  color: string;
  isMod: boolean;
};

export type RGBColor = [number, number, number];

export type Scores = {
  [key: string]: number;
};

export type TimeoutStatus = {
  [key: string]: boolean;
};
