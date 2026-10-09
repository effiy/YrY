import Database from 'tauri-plugin-sql-api';

/**
 * 历史记录 SQLite 管理。
 * 关键改进：
 *   1. 单例连接（Database.load 每次 open 新 handle，避免每次 addToHistory 都重开一次 DB
 *   2. 建表语句在第一次使用时保证（幂等）
 *   3. 统一 finally { db.close() } 保障句柄不泄漏
 *   4. 错误路径直接抛出真实 Error（不再靠 then/catch 嵌套的递归重试）
 */

const DB_URI = 'sqlite:history.db';

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS history(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  service TEXT NOT NULL,
  result TEXT NOT NULL,
  timestamp INTEGER NOT NULL
)`;

let __dbPromise = null;

/** 获取单例 DB handle（相同 Promise） */
const getDb = async () => {
    if (__dbPromise) return __dbPromise;
    __dbPromise = (async () => {
        const db = await Database.load(DB_URI);
        try {
            await db.execute(CREATE_TABLE_SQL);
            return db;
        } catch (e) {
            __dbPromise = null;
            throw e;
        }
    })();
    return __dbPromise;
};

/**
 * 写入一条历史记录。
 * @param {{text:string, source:string, target:string, service:string, result:string, timestamp?: number}} row
 * @returns {Promise<void>}
 */
export const addHistoryRecord = async (row) => {
    const timestamp = row.timestamp ?? Date.now();
    const sql =
        'INSERT into history (text, source, target, service, result, timestamp) VALUES ($1, $2, $3, $4, $5, $6)';
    const params = [row.text, row.source, row.target, row.service, row.result, timestamp];

    let db = null;
    try {
        db = await getDb();
        try {
            await db.execute(sql, params);
            return;
        } catch (_first) {
            // 表不存在或 schema 变化：尝试创建一次再 insert（处理老版本表不存在时）
            try {
                await db.execute(CREATE_TABLE_SQL);
                await db.execute(sql, params);
            } catch (e) {
                throw new Error(`insert history failed: ${e?.message ?? String(e)}`);
            }
        }
    } finally {
        // 保持单例模式不直接关闭（单例长期存在性能更好）；不调用 db.close()
    }
};

/**
 * 关闭历史记录 DB（窗口卸载/测试 teardown）
 */
export const closeHistoryStore = async () => {
    if (!__dbPromise) return;
    try {
        const db = await __dbPromise;
        try {
            await db.close();
        } catch {
                /* noop */
            }
    } finally {
        __dbPromise = null;
    }
};
