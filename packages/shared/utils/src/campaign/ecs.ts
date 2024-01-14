import * as Types from "../../../types/src";

export function EntitySelector(entities: Map<Types.Campaign.Id, Types.Serialization.StateEntitySerialized>) {
	return function getEntity<Type extends Types.Serialization.EntitySerialized>(id: Types.Campaign.Id): Type {
		const entity = entities.get(id);

		if (entity == undefined) {
			throw new Error(`getEntity: invalid id ${id}`);
		}
		return entity as unknown as Type;
	};
}
