import {
	Sqlite,
	type ExecuteOptions,
	type ExecuteResult,
	type QueryOptions,
	type QueryResult,
} from '@capawesome-team/capacitor-sqlite';

type DbQueryOptions = Omit<QueryOptions, 'databaseId'>;
type DbExecuteOptions = Omit<ExecuteOptions, 'databaseId'>;

export type User = {
	id: number;
	email: string;
	name: string;
	dateCreated: string;
	dateModified: string;
};

export const mapDbResults = <T>(result: QueryResult): T[] => {
	const { rows, columns } = result;
	return rows.map((row) => {
		const result: any = {};

		for (let i = 0; i < columns.length; i++) {
			const columnName = columns[i];
			let value = row[i];

			result[columnName] = value;
		}

		return result as T;
	});
};

class DatabaseService {
	private databaseId: string | null = null;
	private opening: Promise<string> | null = null;

	async init(): Promise<void> {
		if (this.databaseId) return;

		if (!this.opening) {
			this.opening = (async () => {
				const { databaseId } = await Sqlite.open({
					path: 'testdb.sqlite3',
					version: 1,
					readOnly: false,
					upgradeStatements: [
						{
							version: 1,
							statements: [
								`CREATE TABLE users (
									id INTEGER PRIMARY KEY AUTOINCREMENT,
									email TEXT NOT NULL UNIQUE,
									name TEXT NOT NULL,
									dateCreated TEXT NOT NULL DEFAULT (datetime('now')),
									dateModified TEXT NOT NULL DEFAULT (datetime('now'))
								)`,
								`INSERT INTO users (email, name) VALUES
									('sarah.chen@email.com', 'Sarah Chen'),
									('michael.rodriguez@email.com', 'Michael Rodriguez'),
									('emma.wilson@email.com', 'Emma Wilson'),
									('james.okonkwo@email.com', 'James Okonkwo'),
									('priya.patel@email.com', 'Priya Patel'),
									('david.kim@email.com', 'David Kim'),
									('olivia.santos@email.com', 'Olivia Santos'),
									('alex.novak@email.com', 'Alex Novak'),
									('fatima.ali@email.com', 'Fatima Ali'),
									('lucas.berg@email.com', 'Lucas Berg')`,
							],
						},
					],
				});

				this.databaseId = databaseId;
				return databaseId;
			})();
		}

		await this.opening;
	}

	private async getDatabaseId(): Promise<string> {
		if (!this.databaseId) {
			await this.init();
		}
		if (!this.databaseId) {
			throw new Error('Database not initialized');
		}
		return this.databaseId;
	}

	async execute(options: DbExecuteOptions): Promise<ExecuteResult> {
		const databaseId = await this.getDatabaseId();
		return await Sqlite.execute({ databaseId, ...options });
	}

	async query(options: DbQueryOptions): Promise<QueryResult> {
		const databaseId = await this.getDatabaseId();
		return await Sqlite.query({ databaseId, ...options });
	}

	async transaction(callback: (db: DatabaseService) => Promise<void>): Promise<void> {
		const databaseId = await this.getDatabaseId();
		await Sqlite.beginTransaction({ databaseId });

		try {
			await callback(this);
			await Sqlite.commitTransaction({ databaseId });
		} catch (err) {
			await Sqlite.rollbackTransaction({ databaseId });
			throw err;
		}
	}

	async close(): Promise<void> {
		if (!this.databaseId) return;
		await Sqlite.close({ databaseId: this.databaseId });
		this.databaseId = null;
		this.opening = null;
	}
}

export const Db = new DatabaseService();
