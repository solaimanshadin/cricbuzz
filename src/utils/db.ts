class DB {
  public collectionName: string;
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  insertOne<T>(newDocument: T): T {
    const oldDocuments: T[] = this.findAll();
    const currentTimestamp =
      new Date().getTime() + Math.floor(Math.random() * 100);
    const newDocumentWithId = {
      _id: currentTimestamp,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      ...newDocument,
    };
    const newDocumentList = [...oldDocuments, newDocumentWithId];

    localStorage.setItem(this.collectionName, JSON.stringify(newDocumentList));
    return newDocumentWithId;
  }

  findAll<T>(): T {
    const data: string | null = localStorage.getItem(this.collectionName);
    const documents = data ? JSON.parse(data) : [];
    return documents;
  }

  updateOneById<T extends { _id: string | number }>(
    _id: string | number,
    dataToUpdate: T
  ) {
    const oldDocuments: T[] = this.findAll();
    const dataToUpdateWithTime = {
      ...dataToUpdate,
      updatedAt: new Date().getTime(),
    };
    const updatedList: T[] = oldDocuments.map((document: T) =>
      document._id == _id ? { ...document, ...dataToUpdateWithTime } : document
    );
    localStorage.setItem(this.collectionName, JSON.stringify(updatedList));
  }

  updateMany<T>(callback: Function) {
    const oldDocuments: T[] = this.findAll();

    const updatedList = oldDocuments.map((document) => callback(document));
    localStorage.setItem(this.collectionName, JSON.stringify(updatedList));
  }

  deleteOneById<T extends { _id?: number | string }>(
    _id: number | string
  ): void {
    const oldDocuments: T[] = this.findAll<T[]>();
    const updatedList = oldDocuments.filter(
      (document: T) => document._id != _id
    );
    localStorage.setItem(this.collectionName, JSON.stringify(updatedList));
  }

  findById<T extends { _id: number | string }>(_id: number | string): T | null {
    const document: T | null =
      this.findAll<T[]>()?.find((document: T) => document._id == _id) || null;
    return document;
  }
}

enum collection {
  matches = "matches",
  teams = "teams",
}

export default {
  match: new DB(collection.matches),
  team: new DB(collection.teams),
};
