import {app} from '@azure/functions';
import './projects';

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async () => ({
    jsonBody: {
      status: 'ok',
      app: 'RenovAI Azure',
    },
  }),
});
