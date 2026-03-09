export type CategoryItem = {
  name: string;
  image: string;
  href: string;
  slug: string;
};

export const CATEGORIES: CategoryItem[] = [
  { name: "Pochette", image: "/placeholders/cat1.jpg", href: "/shop?cat=pochette", slug: "pochette" },
  { name: "Trousse", image: "/placeholders/cat2.jpg", href: "/shop?cat=trousse", slug: "trousse" },
  { name: "Bags", image: "/placeholders/cat3.jpg", href: "/shop?cat=bags", slug: "bags" },
  { name: "Hair Accessories", image: "/placeholders/cat4.jpg", href: "/shop?cat=hair-accessories", slug: "hair-accessories" },
  { name: "Home Decoration", image: "/placeholders/cat5.jpg", href: "/shop?cat=home-decoration", slug: "home-decoration" },
  { name: "Leather Craft", image: "/placeholders/cat6.jpg", href: "/shop?cat=leather-craft", slug: "leather-craft" },
];