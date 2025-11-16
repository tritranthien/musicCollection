import { BaseModel } from "./base.repo";
import { prisma } from "../utils/db.server";

export class LessonModel extends BaseModel {
  constructor() {
    super("lesson");
  }

  async findAll() {
    const lessons = await this.model.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return this.populateFilesForLessons(lessons);
  }

  async findByOwnerId(ownerId) {
    const lessons = await this.model.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return this.populateFilesForLessons(lessons);
  }

  async findById(id) {
    const lesson = await this.model.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lesson) return null;

    const [populatedLesson] = await this.populateFilesForLessons([lesson]);
    return populatedLesson;
  }

  async populateFilesForLessons(lessons) {
    if (!lessons || lessons.length === 0) return lessons;

    const allFileIds = lessons.flatMap(lesson => lesson.fileIds || []);
    const uniqueFileIds = [...new Set(allFileIds)];

    if (uniqueFileIds.length === 0) {
      return lessons.map(lesson => ({ ...lesson, files: [] }));
    }

    const files = await prisma.file.findMany({
      where: {
        id: { in: uniqueFileIds },
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const filesMap = new Map(files.map(file => [file.id, file]));

    return lessons.map(lesson => ({
      ...lesson,
      files: (lesson.fileIds || [])
        .map(fileId => filesMap.get(fileId))
        .filter(Boolean),
    }));
  }

  async createLesson({ title, description, ownerId, classId, fileIds = [] }) {
    // Validate owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });
    
    if (!owner) throw new Error("User not found");

    // Validate files exist
    if (fileIds.length > 0) {
      const filesCount = await prisma.file.count({
        where: { id: { in: fileIds } },
      });
      
      if (filesCount !== fileIds.length) {
        throw new Error("Some files not found");
      }
    }
    const lesson = await this.model.create({
      data: {
        title,
        description,
        ownerId,
        ownerName: owner.name,
        classId,
        fileIds,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const [populatedLesson] = await this.populateFilesForLessons([lesson]);
    return populatedLesson;
  }

  async updateLesson(id, { title, description, ownerId, classId, fileIds }) {
    const data = {};
    
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (classId !== undefined) data.classId = classId;
    
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId },
      });
      
      if (!owner) throw new Error("User not found");
      
      data.ownerId = ownerId;
      data.ownerName = owner.name;
    }
    
    if (fileIds !== undefined) {
      if (fileIds.length > 0) {
        const filesCount = await prisma.file.count({
          where: { id: { in: fileIds } },
        });
        
        if (filesCount !== fileIds.length) {
          throw new Error("Some files not found");
        }
      }

      if (fileIds.length > 10) {
        throw new Error("Maximum 10 files allowed per lesson");
      }

      data.fileIds = fileIds;
    }

    const lesson = await this.model.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const [populatedLesson] = await this.populateFilesForLessons([lesson]);
    return populatedLesson;
  }

  async delete(id) {
    return this.model.delete({
      where: { id },
    });
  }

  async findByClass (classId) {
    const lessons = await this.model.findMany({
      where: { classId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return this.populateFilesForLessons(lessons);
  }
}

export const lessonModel = new LessonModel();