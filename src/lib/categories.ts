export type CategoryItem = {
  name: string;
  image: string;
  href: string;
  slug: string;
};

export const CATEGORIES: CategoryItem[] = [
  {
    name: "Pochette",
    image: "/placeholders/cat1.jpg",
    href: "/categories/pochette",
    slug: "pochette",
  },
  {
    name: "Trousse",
    image: "/placeholders/cat2.jpg",
    href: "/categories/trousse",
    slug: "trousse",
  },
  {
    name: "Bags",
    image: "/placeholders/cat3.jpg",
    href: "/categories/bags",
    slug: "bags",
  },
  {
    name: "Hair Accessories",
    image: "/placeholders/cat4.jpg",
    href: "/categories/hair-accessories",
    slug: "hair-accessories",
  },
  {
    name: "Home Decoration",
    image: "/placeholders/cat5.jpg",
    href: "/categories/home-decoration",
    slug: "home-decoration",
  },
  {
    name: "Leather Craft",
    image: "/placeholders/cat6.jpg",
    href: "/categories/leather-craft",
    slug: "leather-craft",
  },
];