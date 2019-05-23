declare type MyPromiseStatus = 'pending' | 'resolved' | 'rejected';

declare type ResolveFn<T> = (value?: T) => void;

declare type RejectFn<T> = (reason?: T) => void;

declare type MyPromiseFn<T> = (
  resolve: ResolveFn<T>,
  reject: RejectFn<T>
) => void;
