import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';
import { NextRequest } from 'next/server';

// Apollo Server 인스턴스 생성
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error: GraphQLError): GraphQLFormattedError => {
    // 프로덕션 환경에서는 에러 스택 트레이스를 숨김
    if (process.env.NODE_ENV === 'production') {
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    }
    return error;
  },
});

// Next.js API 라우트 핸들러 생성
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => ({ req }),
});

// Next.js API 라우트 핸들러
export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

export async function OPTIONS(request: Request) {
  return handler(request);
}

// Next.js 설정
export const config = {
  api: {
    // Next.js의 기본 body parser를 비활성화 (Yoga가 처리)
    bodyParser: false,
  },
};
