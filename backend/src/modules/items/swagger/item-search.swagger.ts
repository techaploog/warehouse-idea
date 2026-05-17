import { applyDecorators } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";

const sampleResponse = {
  // TODO:
};

export const ItemSearchSwagger = () => {
  return applyDecorators(
    ApiOperation({ summary: "Search for items", description: "..." })
    ApiBody({
        type: itemSearchSchema, // or we should use zod from shared package
        schema: itemSearchSchema,
        examples: {
            "example 1": {
                value: {
                    query: "test",
                    page: 1,
                    limit: 10,
                    sort: "name",
                    sortOrder: "asc",
                },
            },
        },
    }),
    ApiResponse({
        status: 200,
        description: "search items successfully",
        type: itemsResponseSchema,
        schema: itemsResponseSchema,
        examples:{
            success:{
                summary:"Return list of items"
                value:sampleResponse
            },
            emptyResponse:{
                summary:"Return empty list",
                value:[]
            }
        }
    }),
    ApiResponse({
        status:400,
        description:"Invalid request body",
        examples:{
            invalidRequest:{
                summary:"Invalid data format for limit",
                value:{
                    statusCode:400,
                    code:"BAD_REQUEST",
                    message:"Invalid request body",
                    error:"Invalid data format for : limit"
                }
            }
        }
    }),
    ApiResponse({
        status:500,
        description:"Internal server error",
        examples:{
            internalServerError:{
                summary:"Internal server error",
                value:{
                    statusCode:500,
                    code:"INTERNAL_SERVER_ERROR",
                    message:"An unexpected error occurred",
                }
            },
            databaseError:{
                summary:"Database error",
                value:{
                    statusCode:500,
                    code:"DATABASE_ERROR",
                    message:"An error occurred while accessing the database",
                }
            }
        }
    })
);
};
