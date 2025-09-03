import {
  CreateInputType,
  Delegate,
  ModelType,
  UpdateInputType,
} from "../type/type";

export function createBaseRepository<T extends Delegate>(prismaModel: T) {
  // Usamos os tipos inferidos para garantir a segurança em toda a função
  type TModel = ModelType<T>;
  type TCreateInput = CreateInputType<T>;
  type TUpdateInput = UpdateInputType<T>;

  return {
    getAll(): Promise<TModel[]> {
      return (prismaModel as any).findMany({
        orderBy: { name: "asc" },
      });
    },

    getById(id: string): Promise<TModel | null> {
      return prismaModel.findUnique({ where: { id } });
    },

    create(data: TCreateInput): Promise<TModel> {
      return prismaModel.create({ data });
    },

    update(id: string, data: TUpdateInput): Promise<TModel> {
      return prismaModel.update({ where: { id }, data });
    },

    delete(id: string): Promise<TModel> {
      return prismaModel.delete({ where: { id } });
    },
  };
}
