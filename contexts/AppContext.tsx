import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { ContextProviderProps, ContextProviderValue } from "@/types/context";
import { User } from "@/types/user";

// createContext、useEffect、useState：React 的钩子和函数，用于创建上下文和管理状态及副作用。
// toast：从 sonner 库导入，用于显示提示信息。
// ContextProviderProps、ContextProviderValue 和 User：从项目的类型定义文件中导入的类型，用于类型检查。

export const AppContext = createContext({} as ContextProviderValue);

// 创建一个上下文 AppContext，初始值为空对象，并通过类型断言指定其类型为 ContextProviderValue。


// AppContextProvider：定义一个 React 组件，作为上下文提供者。
// children：该组件接收 children 作为属性，用于渲染其子组件。
// 使用 useState 钩子创建 user 状态，用于存储用户信息。

export const AppContextProvider = ({ children }: ContextProviderProps) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

// 定义一个异步函数 fetchUserInfo，用于从后端 API 获取用户信息。
// 发送 POST 请求到 /api/get-user-info 端点，并处理响应。
// 如果请求成功且有用户数据，则更新 user 状态；否则，将 user 状态设置为 null。
// 如果请求失败，捕获异常并设置 user 状态为 null，同时显示错误提示。

  const fetchUserInfo = async function () {
    try {
      const uri = "/api/get-user-info";
      const params = {};

      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });

      if (resp.ok) {
        const res = await resp.json();
        if (res.data) {
          setUser(res.data);
          return;
        }
      }

      setUser(null);
    } catch (e) {
      setUser(null);

      console.log("get user info failed: ", e);
      toast.error("get user info failed");
    }
  };

  // 使用 useEffect 钩子在组件挂载时调用 fetchUserInfo 函数。
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <AppContext.Provider value={{ user, fetchUserInfo }}>
      {children}
    </AppContext.Provider>
  );
};
// AppContextProvider 组件的作用是提供上下文值（即 user 状态和 fetchUserInfo 函数）
//，并且渲染所有它的子组件，使这些子组件可以访问这个上下文值。

// 上下文提供者：AppContext.Provider 组件通过 value 属性传递上下文值，使应用中的其他组件可以通过上下文访问这些值。
// 子组件渲染：AppContextProvider 使用 children 属性渲染它内部的子组件，这些子组件都可以通过 AppContext 访问到提供的 user 状态和 fetchUserInfo 函数。
