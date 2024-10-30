import 'whatwg-fetch';

import { Headers, Request } from 'whatwg-fetch';

// Mock global Request and Headers
global.Request = Request;
global.Headers = Headers;
