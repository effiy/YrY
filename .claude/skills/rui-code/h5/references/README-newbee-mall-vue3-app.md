# newbee-mall-vue3-app (New Bee Mall Vue3 Edition)

> A front-end / back-end separated e-commerce storefront H5 mall system, built on Vue 3 + Vant 4 + Pinia + Vue-Router 4 + better-scroll.
> Back-end API repo: [newbee-ltd/newbee-mall-api](https://github.com/newbee-ltd/newbee-mall-api).
> Online demo: <http://vue3-app.newbee.ltd>

> Source: <https://github.com/newbee-ltd/newbee-mall-vue3-app>
> Verbatim copy from upstream master branch.

## Project Overview

The newbee-mall project is an e-commerce system comprising the newbee-mall storefront and the newbee-mall-admin back-office, built on Spring Boot and Vue plus related technologies.

The storefront includes: home portal, product categories, new arrivals, home carousel, product recommendations, product search, product display, shopping cart, order checkout, order flow, personal order management, member center, help center, and more.

The back-office includes: dashboards, carousel management, product management, order management, member management, category management, settings, and more.

This repository holds the Vue project (Vue 3.x) for the front-end / back-end separated edition of New Bee Mall, aimed primarily at frontend developers.

## newbee-mall Project Family Overview

| Project Name | Repository | Notes |
| :--- | :--- | :--- |
| newbee-mall | [GitHub](https://github.com/newbee-ltd/newbee-mall) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall) | Initial version, Spring Boot + Thymeleaf + MyBatis + MySQL |
| newbee-mall-plus | [GitHub](https://github.com/newbee-ltd/newbee-mall-plus) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall-plus) | Upgraded version, coupons, flash sale, payment, Redis |
| newbee-mall-cloud | [GitHub](https://github.com/newbee-ltd/newbee-mall-cloud) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall-cloud) | Microservices edition, Spring Cloud Alibaba + Nacos + Sentinel + Seata |
| newbee-mall-api | [GitHub](https://github.com/newbee-ltd/newbee-mall-api) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall-api) | Front-end / back-end separated, Spring Boot + MyBatis + Swagger |
| newbee-mall-api-go | [GitHub](https://github.com/newbee-ltd/newbee-mall-api-go) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall-api-go) | Front-end / back-end separated, Go + Gin + MySQL |
| newbee-mall-vue-app | [GitHub](https://github.com/newbee-ltd/newbee-mall-vue-app) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall-vue-app) | Front-end / back-end separated, Vue 2 + Vant |
| newbee-mall-vue3-app | [GitHub](https://github.com/newbee-ltd/newbee-mall-vue3-app) · [Gitee](https://gitee.com/newbee-ltd/newbee-mall-vue3-app) | Front-end / back-end separated, Vue 3 + Vue-Router 4 + Pinia + Vant 4 |
| vue3-admin | [GitHub](https://github.com/newbee-ltd/vue3-admin) · [Gitee](https://gitee.com/newbee-ltd/vue3-admin) | Front-end / back-end separated, Vue 3 + Element-Plus + Vite |

## Technology Stack

- [Vue 3](https://github.com/vuejs/vue) — The progressive JavaScript framework
- [Vue-Router 4](https://github.com/vuejs/router) — Official router
- [Vuex 4](https://github.com/vuejs/vuex/tree/4.0) — State management (the official solution before Pinia)
- [Vant 4](https://github.com/youzan/vant) — Mobile Vue component library
- [better-scroll](https://github.com/ustbhuangyi/better-scroll) — Mobile scrolling solution

## Development & Deployment Docs

The full tutorial is collected in the Juejin booklet "Vue3 + Spring Boot Large Front-end / Back-end Separation Project in Practice", in chapter order:

- Opening: Walk through building a Vue3 + Spring Boot large front-end / back-end separated project
- Project notes and course conventions
- Brand-new optimization and upgrade of the booklet in February 2023
- Full-stack development! What you must know about "front-end / back-end separation"
- History of frontend modularization
- Weighing traditional pages vs. single-page apps
- Preparation and base environment setup (back-end)
- First encounter with Spring Boot — project setup and startup
- A code-simplification weapon! Spring Boot integrating Lombok
- Handling Lombok plugin issues
- Notes on starting and running the mall back-end project
- VSCode configuration and plugins
- Basics: Vue directives
- Introduction to Vue 3 new features
- Basics: Introduction and usage of the Less CSS preprocessor
- The Vite scaffolding tool
- Vue-Router principle overview and usage
- Introduction and usage of Pinia, the global state management plugin
- Setting up the mall frontend H5 dev environment and starting the project
- A weapon for front-end / back-end interaction docs! Spring Boot integrating Swagger
- Handling interface parameters and unified response results
- Interface design conventions and calling practice
- Mall development in practice: user login / user authentication / home / categories / product search / shopping cart / personal info and shipping address / order flow / order processing
- Mall mobile development in practice: New Bee Mall bottom nav / login & register page / home / product categories / product list / product detail / shopping cart / confirm order / address management / my orders
- Common questions walkthrough

Entry: [New Bee Mall Vue3 + Spring Boot Booklet](https://juejin.im/book/6844733826191589390)

## Page Showcase

Covers the following pages (full screenshots are in the `static-files/` directory of the repo):

- Login page
- Home page
- Product search
- Product detail page
- Shopping cart
- Place order
- Address management
- Order list
- Order detail

## Contact the Author

- Email: 2449207463@qq.com
- QQ technical exchange groups: 932227898 / 552142710
- WeChat public account: Programmer Thirteen
- Issue feedback: <https://github.com/newbee-ltd/newbee-mall-vue3-app/issues>

## Software Copyright

This system has applied for software copyright and is protected by the National Copyright Administration and national computer software copyright laws.

## Acknowledgments

- [Vue](https://github.com/vuejs/vue)
- [Vue-Router](https://github.com/vuejs/router)
- [Vuex](https://github.com/vuejs/vuex/tree/4.0)
- [Vant](https://github.com/youzan/vant)
- [better-scroll](https://github.com/ustbhuangyi/better-scroll)
