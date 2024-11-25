export interface Car {
  id: number;
  header: string;
  content: string;
  filePath?: string;
}

export interface CarCreateDto {
  header: string;
  content: string;
  filePath?: string;
}
