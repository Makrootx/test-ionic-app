import { Car, CarCreateDto } from "@/models/Car";
import { DbService } from "./database-service";

export class CarService {
  constructor(private readonly dbService: DbService) {}

  async createTableIfNotExist() {
    await this.dbService.connect();
    const res = await this.dbService.db
      ?.execute(`CREATE TABLE IF NOT EXISTS cars(
        id INTEGER PRIMARY KEY NOT NULL,
        header TEXT NOT NULL,
        content TEXT NOT NULL,
        file_path TEXT
      )`);
    if (res) console.log("table is created " + res);
    await this.dbService.close();
  }

  async getAllCars(): Promise<Car[] | undefined> {
    await this.dbService.connect();
    const res = await this.dbService.db?.query(`SELECT * FROM cars`);
    const data: Car[] | undefined = res?.values?.map((val) => {
      const car: Car = {
        id: val.id,
        header: val.header,
        content: val.content,
        filePath: val.file_path,
      };
      return car;
    });
    console.log(res);
    await this.dbService.close();
    return data;
  }

  async addCar(car: CarCreateDto) {
    await this.dbService.connect();
    const { header, content } = car;
    const filePath = car.filePath ?? null;
    await this.dbService.db?.query(
      `INSERT INTO cars(id, header, content, file_path) VALUES (NULL, ?, ?, ?)`,
      [header, content, filePath]
    );
    await this.dbService.close();
  }

  async getCarById(id: number) {
    await this.dbService.connect();
    const res = await this.dbService.db?.query(
      `SELECT * FROM cars WHERE id = ?;`,
      [id]
    );
    let car: Car | undefined;
    if (res?.values) {
      const carValue = res?.values[0];
      car = {
        content: carValue.content,
        header: carValue.header,
        id: carValue.id,
        filePath: carValue.file_path,
      };
    }
    await this.dbService.close();
    return car;
  }

  async updateCarById(car: Car) {
    const { content, header, filePath, id } = car;
    await this.dbService.connect();
    await this.dbService.db?.query(
      `UPDATE cars SET content=?, header=?, file_path=? WHERE id=?`,
      [content, header, filePath ?? null, id]
    );
    await this.dbService.close();
  }

  async checkFileUsage(filePath: string): Promise<boolean> {
    await this.dbService.connect();
    const res = await this.dbService.db?.query(
      `SELECT * FROM cars WHERE file_path= ?`,
      [filePath]
    );
    await this.dbService.close();
    if (res?.values?.length) return res.values.length > 1;
    return false;
  }

  async deleteCarById(id: number) {
    await this.dbService.connect();
    await this.dbService.db?.query(`DELETE FROM cars WHERE id=?`, [id]);
    await this.dbService.close();
  }
}
