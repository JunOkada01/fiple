declare global {
    interface Window {
      fincode: {
        showCardForm: (options: {
          payment_id: string;
          theme?: {
            mainColor?: string;
            textColor?: string;
            backgroundColor?: string;
          };
          locale?: string;
          onSuccess: (result: any) => void;
          onError: (error: any) => void;
        }) => void;
      };
    }
  }
  
  export {};