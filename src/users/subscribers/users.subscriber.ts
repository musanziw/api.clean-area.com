import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@EventSubscriber()
export class UsersSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    const user = event.entity;
    if (user.password) {
      const salt: string = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  async beforeInsert(event: InsertEvent<User>) {
    const user: User = event.entity;
    const salt: string = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
  }
}
