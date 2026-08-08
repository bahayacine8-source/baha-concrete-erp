export {};

declare global {
  interface Window {
    api: {
      production: {
        create: (data: any) => Promise<any>;

        list: () => Promise<any>;

        updateStatus: (
          id: string,
          status: string
        ) => Promise<any>;
      };
    };

    electronAPI: {
      getAppVersion: () => Promise<string>;
    };
  }
}