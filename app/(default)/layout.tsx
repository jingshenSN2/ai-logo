"use client";

import { AppContextProvider } from "@/contexts/AppContext";
import Footer from "@/components/footer";
import Header from "@/components/header";

export default function ({ children }: { children: React.ReactNode }) {
  return (
    <AppContextProvider>
      <div className="w-screen h-screen">
        <Header />
        <main>
          <div className="mx-auto w-full max-w-7xl overflow-hidden px-5 md:py-10 md:px-10 lg:px-20 lg:py-2">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </AppContextProvider>
  );
}

// AppContextProvider：用作顶层组件，包裹整个应用以提供全局状态管理。所有包裹在 AppContextProvider 内的子组件都可以访问上下文提供的状态和方法。
// div：设置一个宽高为全屏的容器，包含页眉、主要内容区域和页脚。
// Header：页眉组件，通常包含导航和其他全局信息。
// main：主要内容区域，包裹 children 属性传递的内容。
// div：主要内容区域的内层容器，设置了自适应宽度和间距样式，使其在不同屏幕尺寸下都有良好的显示效果。
// Footer：页脚组件，通常包含版权信息和其他全局链接。
