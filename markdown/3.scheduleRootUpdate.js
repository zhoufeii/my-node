// 更新队列

// update 对象的属性
export type Update<State> = {   // 创建的时候将传入的 expirationTime 作为返回的 update 对象的 expirationTime 属性
    // 更新的过期时间
    expirationTime: ExpirationTime,

    // export const UpdateState = 0;    // 更新state
    // export const ReplaceState = 1;    // 替换state
    // export const ForceUpdate = 2;    // 强制更新state
    // export const CaptureUpdate = 3;    // 捕获state，在 react16 中，如果渲染过程中发生错误，可以将其捕获，并渲染出一个错误提示的页面
    // 指定更新的类型，值为以上几种
    tag: 0 | 1 | 2 | 3,
    // 更新内容，比如`setState`接收的第一个参数，如果是第一次渲染的话，传进来的就是 FiberRoot => 见 第37行
    payload: any,
    // 对应的回调，`setState`，`render`都有
    callback: (() => mixed) | null,

    // 指向下一个更新
    next: Update<State> | null,     // updateQueue 是一个单向链表结构，里面每个 update 通过 next 属性与下一个 update 产生关联
    // 指向下一个`side effect`
    nextEffect: Update<State> | null,   // effect 相关，暂时不谈
};

function scheduleRootUpdate(
    current: Fiber,
    element: ReactNodeList,
    expirationTime: ExpirationTime,
    callback: ?Function,
) {
    // 删除dev代码

    const update = createUpdate(expirationTime);    // 用来标记 react 应用中需要更新的地点， 非常重要，createUpdate 就是简单返回一个 Update 对象，结构上面有
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

// 队列更新
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
    // Update queues are created lazily.
    const alternate = fiber.alternate;  // 认为 fiber 是 current， alternate 是 workInProgress，
    // 需要保证 current 和 workInProgress 中的 enqueueUpdate 是相同的
    let queue1;
    let queue2;

    if (alternate === null) {
        // There's only one fiber.
        queue1 = fiber.updateQueue;
        queue2 = null;
        if (queue1 === null) {
            queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        }
    } else {
        // There are two owners.
        // alternate !== null，表示不是第一次渲染
        queue1 = fiber.updateQueue;     // 分别取到 current， workInProgress 中的 updateQueue
        queue2 = alternate.updateQueue;

        // 以下代码是为了保证 current 和 workInProgress 是相同的
        // 虽然整个应用不是第一次渲染，但是当前这个节点可能从来没有产生过更新，所以 queue1，queue2 都等于 null
        // 此时就只需要创建两个 UpdateQueue 并分别放到 queue1 和 queue2 中
        if (queue1 === null) {
            if (queue2 === null) {
                // Neither fiber has an update queue. Create new ones.
                queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
                queue2 = alternate.updateQueue = createUpdateQueue(
                    alternate.memoizedState,
                );
            } else {
                // Only one fiber has an update queue. Clone to create a new one.
                queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
            }
        } else {
            if (queue2 === null) {
                // Only one fiber has an update queue. Clone to create a new one.
                queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
            } else {
                // Both owners have an update queue.
            }
        }
    }

    if (queue2 === null || queue1 === queue2) {
        // There's only a single queue.
        appendUpdateToQueue(queue1, update);
    } else {
        // There are two queues. We need to append the update to both queues,
        // while accounting for the persistent structure of the list — we don't
        // want the same update to be added multiple times.
        if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
            // One of the queues is not empty. We must add the update to both queues.
            appendUpdateToQueue(queue1, update);
            appendUpdateToQueue(queue2, update);
        } else {
            // Both queues are non-empty. The last update is the same in both lists,
            // because of structural sharing. So, only append to one of the lists.
            appendUpdateToQueue(queue1, update);
            // But we still need to update the `lastUpdate` pointer of queue2.
            queue2.lastUpdate = update;
        }
    }
}

// 创建更新队列
export function createUpdateQueue<State>(baseState: State): UpdateQueue<State> {    // 接收 fiber 中之前的 state，赋值给 baseState
    const queue: UpdateQueue<State> = {
        baseState,    // 会在 baseState 的基础上更新

        firstUpdate: null,    // 队列中的第一个更新
        lastUpdate: null,     // 队列中的最后一个更新
        firstCapturedUpdate: null,    // 队列中的第一个渲染错误捕获
        lastCapturedUpdate: null,

        // effect 相关，暂时不谈
        firstEffect: null,
        lastEffect: null,
        firstCapturedEffect: null,
        lastCapturedEffect: null,
    };
    return queue;
}

// 将更新添加到队列中
function appendUpdateToQueue<State>(
    queue: UpdateQueue<State>,
    update: Update<State>,
  ) {
    // Append the update to the end of the list.
    if (queue.lastUpdate === null) {    // 如果队列中没有更新
      // Queue is empty
      queue.firstUpdate = queue.lastUpdate = update;    // 向队列中添加一个更新，并将【第一个更新】与【最后一个更新】都指向这个新添加的更新
    } else {
         // 队列中有更新
      queue.lastUpdate.next = update;   // 向队列中添加一个更新
      queue.lastUpdate = update;    // 并将【最后一个更新】的指向修改为这个新添加的更新
    }
  }