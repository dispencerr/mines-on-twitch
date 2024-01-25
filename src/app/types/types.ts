export type Chat = {
  message: string;
  user: string | undefined;
  color: string | undefined;
};

export type RGBColor = [number, number, number];

export type TmiClient = {
  channels: string[];
};
