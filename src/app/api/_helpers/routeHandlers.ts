import { NextResponse } from "next/server";
import { createBaseService } from "@/backend/services/baseService";

type GenericService = ReturnType<typeof createBaseService>;
type RouteParams = { params: { id: string } };

export function createApiHandlers(service: GenericService) {
  return {
    async GET_ALL() {
      try {
        const items = await service.list();
        return NextResponse.json(items);
      } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    },

    async POST(request: Request) {
      try {
        const body = await request.json();
        const newItem = await service.add(body);
        return NextResponse.json(newItem, { status: 201 });
      } catch (error: any) {
        return new NextResponse(error.message, { status: 400 });
      }
    },

    async GET_BY_ID(request: Request, { params }: RouteParams) {
      try {
        const item = await service.findById(params.id);
        return NextResponse.json(item);
      } catch (error: any) {
        return new NextResponse(error.message, { status: 404 });
      }
    },

    async PUT(request: Request, { params }: RouteParams) {
      try {
        const body = await request.json();
        const updatedItem = await service.edit(params.id, body);
        return NextResponse.json(updatedItem);
      } catch (error: any) {
        return new NextResponse(error.message, { status: 400 });
      }
    },

    async DELETE(request: Request, { params }: RouteParams) {
      try {
        await service.remove(params.id);
        return new NextResponse(null, { status: 204 });
      } catch (error: any) {
        return new NextResponse(error.message, { status: 404 });
      }
    },
  };
}
