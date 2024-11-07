export interface ProductDetailType {
    id: number;
    product_name: string;
    category: {
      id: number;
      category_name: string;
    };
    subcategory: {
      id: number;
      subcategory_name: string;
    };
    gender: string;
    description: string;
    tags: Array<{
      id: number;
      tag_name: string;
    }>;
    variants: Array<{
      id: number;
      color: {
        id: number;
        color_name: string;
      };
      size: {
        id: number;
        size_name: string;
      };
      stock: number;
      price: number;
      status: string;
      images: Array<{
        id: number;
        image: string;
        image_description: string | null;
      }>;
    }>;
    created_at: string;
    is_active: boolean;
  }