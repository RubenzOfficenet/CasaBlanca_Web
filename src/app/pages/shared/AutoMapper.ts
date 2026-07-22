export class Mapper {

    static map<T, TResult>(
        source: T,
        mapper: (source: T) => TResult
    ): TResult {
        return mapper(source);
    }

    static mapList<T, TResult>(
        source: T[],
        mapper: (source: T) => TResult
    ): TResult[] {
        return source.map(mapper);
    }

}