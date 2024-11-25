import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

export class DbService {
  sqlite: SQLiteConnection;
  db?: SQLiteDBConnection;
  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initWebStore() {
    const platform = Capacitor.getPlatform();
    if (platform === "web") {
      const jeepSqliteEl = document.createElement("jeep-sqlite");
      document.body.appendChild(jeepSqliteEl);
      await customElements.whenDefined("jeep-sqlite");

      // Initialize the Web store
      await this.sqlite.initWebStore();
    }
  }

  async connect() {
    const ret = await this.sqlite.checkConnectionsConsistency();
    const isConn = (await this.sqlite.isConnection("db_vite", false)).result;
    if (ret.result && isConn) {
      this.db = await this.sqlite.retrieveConnection("db_vite", false);
    } else {
      this.db = await this.sqlite.createConnection(
        "db_vite",
        false,
        "no-encryption",
        1,
        false
      );
    }
    await this.db.open();
  }

  async close() {
    await this.sqlite.closeConnection("db_vite", false);
  }
}
