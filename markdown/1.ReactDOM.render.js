ReactDOM.render(<App />, document.getElementById('app'));

ReactDOM.render = function (element, container, callback) {
    /**
     * element: React$Element<any>，通过React.createElement创建的
     */
    return legacyRenderSubtreeIntoContainer(
        null,
        element,
        container,
        false,
        callback,
    )
}

function legacyRenderSubtreeIntoContainer(  // render 与 hydrate 共用的渲染方法
    parentComponent: ?React$Component<any, any>,
    children: ReactNodeList,
    container: DOMContainer,
    forceHydrate: boolean,
    callback: ?Function,
) {
    // TODO: Ensure all entry points contain this check     检查传入的dom容器节点是否合理
    invariant(
        isValidContainer(container),
        'Target container is not a DOM element.',
    );

    // TODO: Without `any` type, Flow says "Property cannot be accessed on any
    // member of intersection type." Whyyyyyy.
    let root: Root = (container._reactRootContainer: any);  // 初次渲染的时候，dom容器上不会有 _reactRootContainer 这个属性
    if (!root) {
        // Initial mount  
        // 在 root 值为空的时候，调用 legacyCreateRootFromDOMContainer 并将其返回值【一个React Root的实例】赋值给 dom容器上的属性 和 root
        root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
            container,
            forceHydrate,
        );
        // 删除 callback 部分
        // Initial mount should not be batched.
        DOMRenderer.unbatchedUpdates(() => {
            // 在初次渲染时不使用 batchedUpdates【批量更新】，
            // 其实就是修改了 schedule 中的一个全局变量，然后马上执行内部回调
            if (parentComponent != null) {  // 几乎不存在这种情况，跳过
                root.legacy_renderSubtreeIntoContainer(
                    parentComponent,
                    children,
                    callback,
                );
            } else {
                root.render(children, callback);
            }
        });
    } else {
        // 删除 callback 部分
        // Update
        if (parentComponent != null) {
            root.legacy_renderSubtreeIntoContainer(
                parentComponent,
                children,
                callback,
            );
        } else {
            root.render(children, callback);
        }
    }
    return DOMRenderer.getPublicRootInstance(root._internalRoot);
}

function legacyCreateRootFromDOMContainer(
    container: DOMContainer,
    forceHydrate: boolean,
): Root {
    const shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
    // First clear any existing content.
    if (!shouldHydrate) {   // 不需要调和更新的话，就把 dom容器内部的节点 全部删除
        let rootSibling;
        /**
        * 将 container 的 lastChild 赋值给 rootSibling，并在 while 循环中判断 rootSibling 是否有值
        *   ---- 有则删掉这个子节点，否则退出循环
        */
        while ((rootSibling = container.lastChild)) {
            container.removeChild(rootSibling);
        }
    }

    // Legacy roots are not async by default.
    const isConcurrent = false;
    return new ReactRoot(container, isConcurrent, shouldHydrate);
}

function ReactRoot(container: Container, isConcurrent: boolean, hydrate: boolean, ) {
    // DOMRenderer 属于 react-reconciler/inline.dom 下面的包，负责 react 中负责跟平台无关的，节点调和 以及 任务调度 的操作
    // 
    const root = DOMRenderer.createContainer(container, isConcurrent, hydrate); // createContainer 返回的是一个FiberRoot
    this._internalRoot = root;  // 将这个 FiberRoot 赋值给 _internalRoot 属性， this 指向的是 ReactRoot 的实例对象
}

export function createContainer(    // 创建了一个 FiberRoot
    containerInfo: Container,
    isConcurrent: boolean,
    hydrate: boolean,
): OpaqueRoot {
    return createFiberRoot(containerInfo, isConcurrent, hydrate);   // 此处暂时不必深究，只需要知道返回的是一个 FiberRoot 即可
}

ReactRoot.prototype.render = function (
    children: ReactNodeList, // 传入的组件 => <App />
    callback: ?() => mixed,
): Work {
    const root = this._internalRoot;    // 上面赋值的 reactRoot
    const work = new ReactWork();   // 不重要，自行了解
    callback = callback === undefined ? null : callback;

    if (callback !== null) {
        work.then(callback);
    }
    DOMRenderer.updateContainer(children, root, null, work._onCommit);
    return work;
};

export function updateContainer(
    element: ReactNodeList, // 传入的ReactElement，应用实际的节点 => app
    container: OpaqueRoot,  // 是上面 createContainer 调用 createFiberRoot 生成的 FiberRoot
    parentComponent: ?React$Component<any, any>,
    callback: ?Function,
): ExpirationTime {
    const current = container.current;
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, current);
    // 计算 expirationTime
    // expirationTime 在React16中是一个核心的点，是能够让我们使用 concurrent mode 进行优先级的任务更新的前提
    return updateContainerAtExpirationTime(
        element,
        container,
        parentComponent,
        expirationTime,
        callback,
    );
}

export function updateContainerAtExpirationTime(
    // 传入的参数与上面 updateContainer 相似，就是多了一个 expirationTime
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    expirationTime: ExpirationTime,
    callback: ?Function,
) {
    // TODO: If this is a nested container, this won't be the root.
    const current = container.current;

    // 删除dev代码

    // context 这块可以暂时跳过，因为目前这个版本在 ReactDOM 的api中，没有能够在root节点上提供 context
    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
        container.context = context;
    } else {
        container.pendingContext = context;
    }

    return scheduleRootUpdate(current, element, expirationTime, callback);
}

function scheduleRootUpdate(
    current: Fiber,
    element: ReactNodeList,
    expirationTime: ExpirationTime,
    callback: ?Function,
) {
    // 删除dev代码

    const update = createUpdate(expirationTime);    // 用来标记 react 应用中需要更新的地点， 非常重要
    // Caution: React DevTools currently depends on this property
    // being called "element".
    update.payload = { element }; // 将 FiberRoot 作为参数加入到配置中

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
        warningWithoutStack(
            typeof callback === 'function',
            'render(...): Expected the last optional `callback` argument to be a ' +
            'function. Instead received: %s.',
            callback,
        );
        update.callback = callback;
    }

    // 将 update 添加到更新队列中，
    // 在一个整体的 react 的应用中，会有多个更新在一个节点上产生，跟之前的batchUpdates有关系
    enqueueUpdate(current, update);

    // scheduleWork 的作用是进行任务调度，告诉 react 有更新产生
    // 为什么会有【调度】这个概念？
    // 因为在 react16 中，有了任务优先级这个概念，在同一个更新队列中，react需要先执行优先级高的任务
    scheduleWork(current, expirationTime);
    return expirationTime;
}

// 在 ReactDOM.render 的时候，
// 创建了一个 ReactRoot，
// 同时在 ReactRoot 创建的过程当中，我们创建了一个FiberRoot，
// 并且在创建 FiberRoot 的过程当中，初始化了一个 Fiber 对象，
// 后来在这个 root 上创建了 expirationTime，然后又创建了一个 update 对象，
// 把这个 update 对象放到 root 的节点上之后

// 这就是创建更新的过程，在创建完之后，才会进入更新的过程