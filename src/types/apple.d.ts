export {};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          usePopup?: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            id_token: string;
            code: string;
            state?: string;
          };
          user?: {
            email?: string;
            name?: {
              firstName?: string;
              lastName?: string;
            };
          };
        }>;
      };
    };
  }
}
