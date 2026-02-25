import type { AnalysisReport } from "../types";

const DB_NAME = "SkillSynapseDB";
const STORE_NAME = "reports";
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		
		request.onupgradeneeded = (e) => {
			const db = (e.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
	});
}

export async function getAllReports(): Promise<AnalysisReport[]> {
	try {
		const db = await getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readonly");
			const store = transaction.objectStore(STORE_NAME);
			const request = store.getAll();
			
			request.onsuccess = () => resolve(request.result || []);
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error("Failed to get reports from IndexedDB", error);
		return [];
	}
}

export async function saveReport(report: AnalysisReport): Promise<void> {
	try {
		const db = await getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readwrite");
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(report);
			
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error("Failed to save report to IndexedDB", error);
	}
}

export async function deleteReport(id: string): Promise<void> {
	try {
		const db = await getDB();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readwrite");
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(id);
			
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	} catch (error) {
		console.error("Failed to delete report from IndexedDB", error);
	}
}
