/**
 * Fiber
 * 
 * 1、每一个 ReactElement 都会对应一个 Fiber 对象，会记录节点的各种状态。
 *  (1) 比如我们的 class component， 它的 state 和 props 是记录在 Fiber 对象上的，
 *      在 Fiber 对象更新之后，才会更新到 class component 的 this.state 和 this.props 里面，
 *      而并不是直接在 class component 自身内部进行调和的。
 *      
 *      这也是 hooks 实现的一个重要因素，因为 hooks 是用在 functional component 中的，
 *       functional component 最大的问题就是没有 this，而我们储存和修改数据都是在 Fiber 上进行的，与 this 并无关系，
 *          所以我们也有能力让 functional component 在需要数据的时候拿到 Fiber 上更新后的值
 * 
 * 2、串联每个应用，将整个应用串联为一个树形结构。
 *    （1）在 ReactElement 中，我们通过 props.children 将每个子节点串联起来；
 *          又因为每个 ReactElement 都对应一个 Fiber 对象，
 *          所以 Fiber 也可以通过自身的属性（return、child、sibling）将每个节点串联起来，变成一个单向的树形链表结构
 * 
 *      *** 需要注意的是，在 ReactElement 的串联关系中， parent 的子节点都是 child，
 *          但是在 Fiber 中，只有第一个子节点是 child，其它子节点将会通过 sibling 与第一个子节点产生联系
 */

// Fiber对应一个组件需要被处理或者已经处理了，一个组件可以有一个或者多个Fiber
type Fiber = {|
    // 标记不同的组件类型
    tag: WorkTag,   // 原生组件 / class 组件 / functional 组件 / react提供的内置组件

        // ReactElement里面的key
        key: null | string,     // 就是作为标记的 key

            // ReactElement.type，也就是我们调用`createElement`的第一个参数
            elementType: any,

                // The resolved function/class/ associated with this fiber.
                // 异步组件resolved之后返回的内容，一般是`function`或者`class`
                type: any,  // 记录 lazy component 返回的时候，需要返回的是 functional component 还是 class component

                    // The local state associated with this fiber.
                    // 跟当前Fiber相关本地状态（比如浏览器环境就是DOM节点）

                    // 1、class component => 这个组件的实例；2、dom节点 => dom节点的实例；3、functional component => 没有 stateNode
                    // 有 stateNode 的话，在应用更新之后，会将 state 和 props 挂载到这个属性上
                    stateNode: any,

    // 指向他在Fiber节点树中的`parent`，用来在处理完这个节点之后向上返回
    return: Fiber | null,

    // 单链表树结构
    // 指向自己的第一个子节点
    child: Fiber | null,
        // 指向自己的兄弟结构
        // 兄弟节点的return指向同一个父节点
        sibling: Fiber | null,
            index: number,

                // ref属性
                ref: null | (((handle: mixed) => void) & { _stringRef: ? string}) | RefObject,

                    // 新的变动带来的新的props
                    pendingProps: any,
                        // 上一次渲染完成之后的props
                        memoizedProps: any,

                            // 该Fiber对应的组件产生的Update会存放在这个队列里面
                            // 某个节点执行了 setState 或者ForceUpdate，那么这个更新就会被放到这个队列中
                            // 会返回一个新的 state
                            updateQueue: UpdateQueue<any> | null,

                                // 上一次渲染的时候的state
                                memoizedState: any,

                                // 一个列表，存放这个Fiber依赖的context
                                firstContextDependency: ContextDependency<mixed> | null,

                                // 用来描述当前Fiber和他子树的`Bitfield`
                                // 共存的模式表示这个子树是否默认是异步渲染的
                                // Fiber被创建的时候他会继承父Fiber
                                // 其他的标识也可以在创建的时候被设置
                                // 但是在创建之后不应该再被修改，特别是他的子Fiber创建之前
                                mode: TypeOfMode,

                                // Effect
                                // 用来记录Side Effect
                                effectTag: SideEffectTag,

                                // 单链表用来快速查找下一个side effect
                                nextEffect: Fiber | null,

                                // 子树中第一个side effect
                                firstEffect: Fiber | null,
                                // 子树中最后一个side effect
                                lastEffect: Fiber | null,

                                // 代表任务在未来的哪个时间点应该被完成【过期时间】
                                // 不包括他的子树产生的任务
                                expirationTime: ExpirationTime,

                                // 快速确定子树中是否有不在等待的变化
                                childExpirationTime: ExpirationTime,

                                // 在Fiber树更新的过程中，每个Fiber都会有一个跟其对应的Fiber【Fiber的克隆】
                                // 我们称他为`current <==> workInProgress`
                                // 在渲染完成之后他们会交换位置     double buffer 用于提高性能【双缓冲技术】
                                alternate: Fiber | null,

                                // 下面是调试相关的，收集每个Fiber和子树渲染时间的

                                actualDuration ?: number,

                                // If the Fiber is currently active in the "render" phase,
                                // This marks the time at which the work began.
                                // This field is only set when the enableProfilerTimer flag is enabled.
                                actualStartTime ?: number,

                                // Duration of the most recent render time for this Fiber.
                                // This value is not updated when we bailout for memoization purposes.
                                // This field is only set when the enableProfilerTimer flag is enabled.
                                selfBaseDuration ?: number,

                                // Sum of base times for all descedents of this Fiber.
                                // This value bubbles up during the "complete" phase.
                                // This field is only set when the enableProfilerTimer flag is enabled.
                                treeBaseDuration ?: number,

                                // Conceptual aliases
                                // workInProgress : Fiber ->  alternate The alternate used for reuse happens
                                // to be the same as work in progress.
                                // __DEV__ only
                                _debugID ?: number,
                                _debugSource ?: Source | null,
                                _debugOwner ?: Fiber | null,
                                _debugIsCurrentlyTiming ?: boolean,
  |};