export default interface ICommand<TArgs extends object, TRet = void> {
    handle(args: TArgs): TRet;
}
