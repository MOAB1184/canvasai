import fs from 'fs/promises';
import path from 'path';

export class Test {
  static TestModule = {
    async saveRecording(file: File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), 'uploads');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir);
      }

      const filePath = path.join(uploadDir, file.name);
      await fs.writeFile(filePath, buffer);
      return filePath;
    },
  };
}
