export type Chat = {
  message: string;
  user: string | undefined;
  color: string | undefined;
};

export type RGBColor = [number, number, number];

export type Scores = {
  [key: string]: number;
};

export type TimeoutStatus = {
  [key: string]: boolean;
};
