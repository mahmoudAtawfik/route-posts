import { Pipe, PipeTransform } from '@angular/core';
import { IPost } from '../../core/models/user/posts';

@Pipe({
  name: 'searchByName',
})
export class SearchByNamePipe implements PipeTransform {
  transform(posts: IPost[], searchTerm: string): IPost[] {
    return posts.filter((el) => el.user.name.includes(searchTerm));
  }
}
